import jwt from 'jsonwebtoken';
// 👇 ADD THIS just to be safe
import dotenv from 'dotenv';
dotenv.config(); 

const generateToken = (id) => {
  // Debug line: Print it to console to see if it exists
  console.log("Secret used:", process.env.JWT_SECRET); 

  if (!process.env.JWT_SECRET) {
      throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;