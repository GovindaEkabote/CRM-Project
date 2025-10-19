exports.userResp = (users) => {
  return users.map((user) => ({
    name: user.name,
    empId: user.empId,
    email: user.email,
    userType: user.userType,
    userStatus: user.userStatus,
  }));
};
