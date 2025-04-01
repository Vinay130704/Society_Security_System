const Event = require("../models/Event");
const User = require("../models/User");
const { getIO } = require("../socket");

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

    // Notify all residents about new event
    const io = getIO();
    io.emit('newEvent', { 
      message: `New event: ${title} on ${date}`,
      event
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
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
      populate: 'organizer'
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
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees', 'name email');

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
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message
    });
  }
};

// Admin: Update Event
exports.updateEvent = async (req, res) => {
  try {
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

    // Notify attendees about updates
    const io = getIO();
    io.emit('eventUpdated', {
      message: `Event updated: ${event.title}`,
      event
    });

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
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
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Notify attendees about cancellation
    const io = getIO();
    io.emit('eventCancelled', {
      message: `Event cancelled: ${event.title}`,
      eventId: req.params.id
    });

    res.json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message
    });
  }
};

// Resident: Register for Event
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    if (event.isCancelled) {
      return res.status(400).json({
        success: false,
        message: "Event is cancelled"
      });
    }

    if (event.attendees.includes(req.user.userId)) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this event"
      });
    }

    event.attendees.push(req.user.userId);
    await event.save();

    // Send confirmation to resident
    const io = getIO();
    io.to(`user_${req.user.userId}`).emit('eventRegistration', {
      message: `You've successfully registered for ${event.title}`,
      event
    });

    res.json({
      success: true,
      message: "Registered for event successfully",
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering for event",
      error: error.message
    });
  }
};