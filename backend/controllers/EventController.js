const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");

// Admin: Create Event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, imageUrl } = req.body;
    
    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      organizer: req.user.userId,
      imageUrl
    });

    await event.save();

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message
    });
  }
};

// Get All Events with Pagination
exports.getAllEvents = async (req, res) => {
  try {
    const { past, limit = 10, page = 1 } = req.query;
    let query = { isCancelled: false };

    if (past === 'true') {
      query.date = { $lt: new Date() };
    } else {
      query.date = { $gte: new Date() };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: 1 },
      populate: { path: 'organizer', select: 'name email' }
    };

    const events = await Event.paginate(query, options);

    res.json({
      success: true,
      data: {
        events: events.docs,
        pagination: {
          total: events.totalDocs,
          limit: events.limit,
          page: events.page,
          pages: events.totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message
    });
  }
};

// Get Single Event
exports.getEventById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID"
      });
    }
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID"
      });
    }
    res.status(500).json({
      success: false,
      message: "Error retrieving event",
      error: error.message
    });
  }
};

// Admin: Update Event
exports.updateEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message
    });
  }
};

// Admin: Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message
    });
  }
};