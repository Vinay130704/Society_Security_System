const User = require("../models/User");

// Function to delete users who are unapproved after 24 hours
const deleteUnapprovedUsers = async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const result = await User.deleteMany({ 
      isApproved: false, 
      createdAt: { $lt: twentyFourHoursAgo } 
    });

    console.log(`Deleted ${result.deletedCount} unapproved users`);
  } catch (error) {
    console.error("Error deleting unapproved users:", error);
  }
};

module.exports = deleteUnapprovedUsers;
