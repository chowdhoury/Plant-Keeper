import React, { useState, useEffect } from 'react';
import ModeSelector from './components/ModeSelector';
import EnvironmentMonitor from './components/EnvironmentMonitor';
import SoilMoistureGrid from './components/SoilMoistureGrid';
import MotorControls from './components/MotorControls';
import TimerControl from './components/TimerControl';
import NotificationBanner from './components/NotificationBanner';
import { Flower } from 'lucide-react';
import { getDatabase, ref, get, set, onValue } from "firebase/database";
import app from "./firebase-config";

type Mode = 'Manual' | 'Auto' | 'Timer';

function App() {
  const [mode, setMode] = useState<Mode>('Manual');
  const [selectedHours, setSelectedHours] = useState(1);
  const [notification, setNotification] = useState<string | null>(null);
  const [lastEmailSent, setLastEmailSent] = useState<number>(0);
  
  const [motorStates, setMotorStates] = useState<boolean[]>([false, false, false, false]); // Array for motor states

  const [data, setData] = useState({
    Humidity: null,
    Plant_1: null,
    Plant_2: null,
    Plant_3: null,
    Plant_4: null,
    Temp: null,
    isConnected: null,
    operation_mode: null,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getDatabase(app);
        const nodeNames = [
          "Humidity",
          "Plant_1",
          "Plant_2",
          "Plant_3",
          "Plant_4",
          "Temp",
          "isConnected",
          "operation_mode",
        ];
  
        const promises = nodeNames.map((node) =>
          get(ref(db, node)).then((snapshot) => ({
            [node]: snapshot.exists() ? snapshot.val() : null,
          }))
        );
  
        const results = await Promise.all(promises);
        const combinedData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setData(combinedData);
  
        // Ensure loading state is cleared after data is fetched
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Failed to fetch data:", err.message);
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
  
        setLoading(false); // Stop loading even on error
      }
    };
  
    // Fetch data immediately and set up interval for every 1 second
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 5000);
  
    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  // Fetch initial data and listen for mode changes
  useEffect(() => {
    const db = getDatabase(app);
    const modeRef = ref(db, 'operation_mode');

    // Listen for mode changes in Firebase
    const unsubscribe = onValue(modeRef, (snapshot) => {
      if (snapshot.exists()) {
        const newMode = snapshot.val();
        setMode(newMode); // Update local state when mode changes in Firebase
        // console.log(`Mode updated to: ${newMode}`);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Update Firebase when mode changes locally
  const handleModeChange = async (newMode: Mode) => {
    setMode(newMode); // Update local state immediately
  
    // Reset motor states to off when changing mode
    setMotorStates([false, false, false, false]);
  
    // Stop the timer if running
    const db = getDatabase(app);
    await set(ref(db, 'isCounting'), false); // Stop countdown in Firebase
    await set(ref(db, 'timer'), 0); // Reset timer in Firebase
  
    try {
      await set(ref(db, 'operation_mode'), newMode); // Update mode in Firebase
  
      // Reset motor states in Firebase (optional)
      const motorRefs = [
        ref(db, "motor_1"),
        ref(db, "motor_2"),
        ref(db, "motor_3"),
        ref(db, "motor_4"),
      ];
  
      motorRefs.forEach((motorRef) => {
        set(motorRef, false); // Set each motor state to false in Firebase
      });
    } catch (err) {
      console.error("Failed to update mode in Firebase:", err);
    }
  };
  
  // Set up real-time listeners for motor states
  useEffect(() => {
    const db = getDatabase(app);

    const motorRefs = [
      ref(db, "motor_1"),
      ref(db, "motor_2"),
      ref(db, "motor_3"),
      ref(db, "motor_4"),
    ];

    motorRefs.forEach((motorRef, index) => {
      const unsubscribe = onValue(motorRef, (snapshot) => {
        if (snapshot.exists()) {
          const motorState = snapshot.val();
          setMotorStates((prevStates) => {
            const updatedStates = [...prevStates];
            updatedStates[index] = motorState;
            return updatedStates;
          });
        }
      });

      return () => unsubscribe(); // Cleanup listener on unmount
    });
  }, []);

  useEffect(() => {
    if (mode === 'Auto') {
      const controlMotors = () => {
        const updatedStates = [...motorStates];
  
        // Check each plant's moisture level and adjust motor states
        if (data.Plant_1 !== null && typeof data.Plant_1 === 'number') {
          updatedStates[0] = data.Plant_1 < 20 || (motorStates[0] && data.Plant_1 < 80);
        }
        if (data.Plant_2 !== null && typeof data.Plant_2 === 'number') {
          updatedStates[1] = data.Plant_2 < 20 || (motorStates[1] && data.Plant_2 < 80);
        }
        if (data.Plant_3 !== null && typeof data.Plant_3 === 'number') {
          updatedStates[2] = data.Plant_3 < 20 || (motorStates[2] && data.Plant_3 < 80);
        }
        if (data.Plant_4 !== null && typeof data.Plant_4 === 'number') {
          updatedStates[3] = data.Plant_4 < 20 || (motorStates[3] && data.Plant_4 < 80);
        }

        // Update motor states in Firebase and locally
        updatedStates.forEach(async (state, index) => {
          if (motorStates[index] !== state) {
            try {
              const db = getDatabase(app);
              await set(ref(db, `motor_${index + 1}`), state);
              // console.log(`Motor ${index + 1} state set to ${state}`);
            } catch (err) {
              console.error(`Failed to update motor ${index + 1} state:`, err);
            }
          }
        });
  
        setMotorStates(updatedStates); // Update locally
      };

      // Check and update motor states every 1 second
      const intervalId = setInterval(controlMotors, 1000);

      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [mode, data, motorStates]);

  useEffect(() => {
    const checkConnection = async () => {
      const db = getDatabase(app);
      const isConnectedRef = ref(db, 'isConnected');
  
      try {
        const snapshot = await get(isConnectedRef);
        if (snapshot.exists() && snapshot.val() === true) {
          // If `isConnected` is true, update it to false
          await set(isConnectedRef, false);
          setNotification('Device Connected');
        } else {
          setNotification('Device Not Connected');
        }
      } catch (err) {
        console.error('Failed to check connection status:', err);
        // setNotification('Error checking connection status');
      }
    };
  
    // Run checkConnection every minute
    const intervalId = setInterval(checkConnection, 6000);
    checkConnection(); // Initial check
  
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);
  

  // Handle motor toggle and update the database
  const handleMotorToggle = async (index: number) => {
    if (mode === 'Manual') {
      const updatedStates = [...motorStates];
      updatedStates[index] = !updatedStates[index];
      setMotorStates(updatedStates); // Update locally

      try {
        const db = getDatabase(app);
        await set(ref(db, `motor_${index + 1}`), updatedStates[index]); // Sync with database
        console.log(`Motor ${index + 1} state updated to ${updatedStates[index]}`);
      } catch (err) {
        console.error("Failed to update motor state in database:", err);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleMotorsOn = () => {
    console.log("Checking moisture levels to turn on motors...");
    const updatedStates = motorStates.map((_, index) => {
      const plantMoisture = data[`Plant_${index + 1}` as keyof typeof data];
      console.log(`Plant_${index + 1} Moisture:`, plantMoisture); // Debug moisture values
      return typeof plantMoisture === 'number' && plantMoisture < 20; // Turn on motor if moisture < 20
    });

    console.log("Updated Motor States:", updatedStates); // Debug motor states
    setMotorStates(updatedStates); // Update local state

    const db = getDatabase(app);
    updatedStates.forEach((state, index) => {
      set(ref(db, `motor_${index + 1}`), state) // Sync motor states to Firebase
        .then(() => console.log(`Motor_${index + 1} set to ${state}`)) // Confirm Firebase update
        .catch((err) => console.error(`Failed to update Motor_${index + 1} in Firebase:`, err));
    });
  };

  const handleMotorsOff = () => {
    console.log("Turning off all motors");
    setMotorStates([false, false, false, false]); // Update local state to reflect motors being on
    const db = getDatabase(app);
    const motorRefs = [
      ref(db, "motor_1"),
      ref(db, "motor_2"),
      ref(db, "motor_3"),
      ref(db, "motor_4"),
    ];

    motorRefs.forEach((motorRef) => {
      set(motorRef, false); // Update the state of each motor in Firebase
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex items-center gap-3 mb-8">
          <Flower className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Smart Irrigation Control System 
          </h1>
          <h1 className="text-3xl font-bold text-gray-900">
          {notification && (
              <div className="text-center my-4">
                <span
                  className={
                    notification === 'Device Connected'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {notification === 'Device Connected'
                    ? '(Device Connected)'
                    : '(Device Not Connected)'}
                </span>
              </div>
            )}
          </h1>
        </header>

        <ModeSelector currentMode={mode} onModeChange={handleModeChange} />

        <EnvironmentMonitor temperature={data.Temp} humidity={data.Humidity} />

        <SoilMoistureGrid
          moistureLevels={[data.Plant_1, data.Plant_2, data.Plant_3, data.Plant_4]}
        />

        <MotorControls
          motorStates={motorStates}
          onToggleMotor={handleMotorToggle}
          isManualMode={mode === 'Manual'}
        />

        <TimerControl
          selectedHours={selectedHours}
          onTimerChange={setSelectedHours}
          visible={mode === 'Timer'}
          onMotorsOn={handleMotorsOn}
          offMotors={handleMotorsOff}
        />

       
      </div>
    </div>
  );
}

export default App;
