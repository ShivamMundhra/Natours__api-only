const nodemailer = require('nodemailer');

const sendEmail = async options => {
  /*STEPS
    1)Create A transporter
    2)Define the Email Options
    3)Send the email
    */
  // const transporter = nodemailer.createTransport({
  //     service: ' Gmail',
  //     auth :{
  //         user:process.env.EMAIL_USERNAME,
  //         pass:process.env.EMAIL_PASSWORD
  //     }
  //     //Activate in gmail " less secure app"
  // })
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  //   2)
  const mailOptions = {
    from: 'Shivam Mundhra <jaiveeru4478@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    //   html:
  };
  // 3)
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
