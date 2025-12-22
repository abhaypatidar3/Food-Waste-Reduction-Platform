// whenever i want hash a password
import bcrypt from 'bcryptjs'
const hashedPassword = await bcrypt.hash('@Abhay9784', 10);
console.log(hashedPassword);