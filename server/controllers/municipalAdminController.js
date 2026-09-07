const municipalAdminRepository = require("../repositories/municipalAdminRepository");

// =================================
// Register Municipal Admin
// =================================
const registerMunicipalAdmin = async (req, res, next) => {
  try {
    const admin = await municipalAdminRepository.createAdmin(req.body);

    res.status(201).json({
      success: true,
      message: "Municipal Admin registered successfully",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// =================================
// Dashboard
// =================================
const getDashboard = async (req, res, next) => {
  try {

    const admin = await municipalAdminRepository.getAdminById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Municipal Admin not found",
      });
    }

    const dashboard = await municipalAdminRepository.dashboard(req.user.id);

    res.status(200).json({
      success: true,
      data: dashboard,
    });

  } catch (error) {
    next(error);
  }
}
// =================================
// Get All Municipal Admins
// =================================
const getAllMunicipalAdmins = async (req, res, next) => {
  try {
    const admins = await municipalAdminRepository.getAdmins();

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

// =================================
// Get Municipal Admin By ID
// =================================
const getMunicipalAdminById = async (req, res, next) => {
  try {
    const admin = await municipalAdminRepository.getAdminById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Municipal Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// =================================
// Update Municipal Admin
// =================================
const updateMunicipalAdmin = async (req, res, next) => {
  try {
    const id = req.params.id || req.user.id;

    const data = {
      ...req.body,
    };

    if (req.file) {
      data.profile_image = req.file.path;
    }

    const admin = await municipalAdminRepository.updateAdmin(id, data);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Municipal Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Municipal Admin updated successfully",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// =================================
// Delete Municipal Admin
// =================================
const deleteMunicipalAdmin = async (req, res, next) => {
  try {
    const admin = await municipalAdminRepository.deleteAdmin(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Municipal Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Municipal Admin deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =================================
// Get My Profile
// =================================
const getMyProfile = async (req, res, next) => {
  try {
    const admin = await municipalAdminRepository.getAdminById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Municipal Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerMunicipalAdmin,
  getDashboard,
  getAllMunicipalAdmins,
  getMunicipalAdminById,
  updateMunicipalAdmin,
  deleteMunicipalAdmin,
  getMyProfile,
};