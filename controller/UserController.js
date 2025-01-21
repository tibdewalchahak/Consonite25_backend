const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Function to generate random alphanumeric code
const generateCode = () => {
  return Math.random().toString(36).substr(2, 5).toUpperCase(); // 8-character code
};

// Handle form submission
const submitForm = async (req, res) => {
  const { name, email, phone, isVNIT } = req.body;

  try {
    // Save user details in the database
    const user = new User({ name, email, phone, isVNIT });
    await user.save();

    // If VNIT, inform them to collect passes
    if (isVNIT) {
      return res.status(200).json({
        message: 'Please collect your passes from the canteen.',
      });
    } else {
      return res.status(200).json({
        message: 'Proceed to payment.',
        userId: user._id,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error submitting form.' });
  }
};

// Handle payment gateway callback
const paymentCallback = async (req, res) => {
  const { userId, paymentStatus } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (paymentStatus === 'success') {
      // Generate a unique ticket code
      const ticketCode = generateCode();
      user.ticketCode = ticketCode;
      user.paymentStatus = 'success';
      await user.save();

      // Add unique code to the ticket PDF
      const existingPdfBytes = fs.readFileSync("./ticket/ticket.pdf");

        // Modify the PDF
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Add the unique code to the bottom-right corner
        const { width, height } = firstPage.getSize();
        firstPage.drawText(`Unique Code: ${ticketCode}`, {
          x: width - 150,
          y: 50, // Adjust Y position based on your ticket design
          size: 12,
          color: rgb(0, 0, 0),
        });

        // Serialize the modified PDF
        const pdfBytes = await pdfDoc.save();

      // Send the ticket via email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Your Ticket',
        text: `Thank you for your payment! Your unique ticket code is: ${ticketCode}`,
        attachments: [
          {
            filename: `${user.email}-ticket.pdf`,
            content: pdfBytes,
            path: editedTicketPath,
          },
        ],
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: 'Ticket sent successfully!' });
    } else {
      return res.status(400).json({ message: 'Payment failed.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error processing payment.' });
  }
};

module.exports = { submitForm, paymentCallback };
