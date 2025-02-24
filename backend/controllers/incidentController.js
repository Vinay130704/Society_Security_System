const Incident = require("../models/Incident");

exports.reportIncident = async (req, res) => {
  try {
    const { recipientEmail, incidentTitle, incidentDescription } = req.body;

    if (!recipientEmail || !incidentTitle || !incidentDescription) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newIncident = new Incident({
      description: `${incidentTitle}: ${incidentDescription}`,
      reportedBy: req.user.id,
    });

    await newIncident.save();
    res.json({ message: "Incident reported successfully" });

    // Optional: Trigger alert after saving
    const { sendAlert } = require("../services/alertService");
    sendAlert(recipientEmail, incidentTitle, incidentDescription);
    
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
    return res.json({incidents});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
