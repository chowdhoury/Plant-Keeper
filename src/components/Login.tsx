import React, { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import app from "../firebase-config";

const MultiNodeComponent: React.FC = () => {
  const [data, setData] = useState({
    Humidity: null,
    Plan_1: null,
    Plant_2: null,
    Plant_3: null,
    Plant_4: null,
    Temp: null,
    isConnected: null,
    motor_1: null,
    motor_2: null,
    motor_3: null,
    motor_4: null,
    operation_mode: null,
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const db = getDatabase(app);

        // Array of promises to fetch data from each node
        const nodeNames = [
          "Humidity",
          "Plan_1",
          "Plant_2",
          "Plant_3",
          "Plant_4",
          "Temp",
          "isConnected",
          "motor_1",
          "motor_2",
          "motor_3",
          "motor_4",
          "operation_mode",
        ];

        const promises = nodeNames.map((node) =>
          get(ref(db, node)).then((snapshot) => ({
            [node]: snapshot.exists() ? snapshot.val() : null,
          }))
        );

        const results = await Promise.all(promises);

        // Merge all results into a single object
        const combinedData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

        setData(combinedData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs once on mount

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Data from Multiple Nodes</h1>
      <div>
        <h2>Humidity</h2>
        <pre>{JSON.stringify(data.Humidity, null, 2)}</pre>

        <h2>Plan 1</h2>
        <pre>{JSON.stringify(data.Plan_1, null, 2)}</pre>

        <h2>Plant 2</h2>
        <pre>{JSON.stringify(data.Plant_2, null, 2)}</pre>

        <h2>Plant 3</h2>
        <pre>{JSON.stringify(data.Plant_3, null, 2)}</pre>

        <h2>Plant 4</h2>
        <pre>{JSON.stringify(data.Plant_4, null, 2)}</pre>

        <h2>Temperature</h2>
        <pre>{JSON.stringify(data.Temp, null, 2)}</pre>

        <h2>Is Connected</h2>
        <pre>{JSON.stringify(data.isConnected, null, 2)}</pre>

        <h2>Motor 1</h2>
        <pre>{JSON.stringify(data.motor_1, null, 2)}</pre>

        <h2>Motor 2</h2>
        <pre>{JSON.stringify(data.motor_2, null, 2)}</pre>

        <h2>Motor 3</h2>
        <pre>{JSON.stringify(data.motor_3, null, 2)}</pre>

        <h2>Motor 4</h2>
        <pre>{JSON.stringify(data.motor_4, null, 2)}</pre>

        <h2>Operation Mode</h2>
        <pre>{JSON.stringify(data.operation_mode, null, 2)}</pre>
      </div>
    </div>
  );
};

export default MultiNodeComponent;
