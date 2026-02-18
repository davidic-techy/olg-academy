import PDFDocument from 'pdfkit';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

export const downloadCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ 
      student: req.user.id, 
      course: req.params.courseId 
    }).populate('student').populate('course');

    // 1. Validation: Must be 100% complete
    const course = await Course.findById(req.params.courseId).populate({ path: 'modules', populate: { path: 'lessons' }});
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    
    if (enrollment.completedLessons.length < totalLessons) {
      return res.status(403).json({ message: "Course not completed yet." });
    }

    // 2. Setup PDF Stream
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
    const filename = `Certificate-${enrollment.course.title}.pdf`;

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // 3. Draw Certificate Design
    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8fafc');
    doc.lineWidth(20).strokeColor('#2563eb').rect(0, 0, doc.page.width, doc.page.height).stroke();

    // Content
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(30).fillColor('#1e293b').text('CERTIFICATE OF COMPLETION', { align: 'center' });
    
    doc.moveDown();
    doc.font('Helvetica').fontSize(15).fillColor('#64748b').text('This is to certify that', { align: 'center' });
    
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(40).fillColor('#2563eb').text(enrollment.student.name, { align: 'center' });
    
    doc.moveDown();
    doc.font('Helvetica').fontSize(15).fillColor('#64748b').text('Has successfully completed the course', { align: 'center' });
    
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(25).fillColor('#1e293b').text(enrollment.course.title, { align: 'center' });

    doc.moveDown(4);
    doc.fontSize(12).fillColor('#94a3b8').text(`Date Issued: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.text(`Certificate ID: OLG-${enrollment._id}`, { align: 'center' });

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};