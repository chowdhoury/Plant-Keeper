import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init("YOUR_PUBLIC_KEY");

export const sendLowMoistureAlert = async (plantNumbers: number[]) => {
  try {
    const response = await emailjs.send(
      "YOUR_SERVICE_ID",  // e.g., "gmail_service"
      "YOUR_TEMPLATE_ID", // e.g., "template_xyz123"
      {
        to_email: 'mdr8077@gmail.com',
        subject: 'Low Moisture Alert',
        message: `Low moisture levels detected in Plant${
          plantNumbers.length > 1 ? 's' : ''
        } ${plantNumbers.join(', ')}! Please check your irrigation system.`,
      }
    );
    return response;
  } catch (error) {
    // console.error('Failed to send email:', error);
    // throw error;
  }
};