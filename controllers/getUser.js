const mongoose = require("mongoose");
const User = require("../models/user");

const getUser = async (userId) => {
    const user = await User.findOne({_id: userId});
    // console.log(user);
    return user;
}

module.exports = getUser;