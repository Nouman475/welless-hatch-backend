class UserDTO {
  constructor(user) {
    this.id = user._id;
    this.name = user.name;
    this.email = user.email;
    this.userName = user.userName;
    this.role = user.role;
    this.profilePicture = user.profilePicture;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.isActive = user.isActive;
  }
}

export default UserDTO;
