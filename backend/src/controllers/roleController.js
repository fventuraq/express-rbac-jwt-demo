// src/controllers/roleController.js
const roleService = require("../services/roleService");

const getAllRoles = async (req, res) => {
  try {
    res.json(await roleService.getAll());
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ error: "Error al obtener roles." });
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await roleService.getById(req.params.id);
    if (!role) return res.status(404).json({ error: "Rol no encontrado." });
    res.json(role);
  } catch (error) {
    console.error("Error al obtener rol:", error);
    res.status(500).json({ error: "Error al obtener rol." });
  }
};

const createRole = async (req, res) => {
  try {
    const { rolnom, funcs } = req.body;

    if (!rolnom || rolnom.trim() === "") {
      return res.status(400).json({ error: "rolnom es obligatorio." });
    }
    if (!Array.isArray(funcs) || funcs.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe asociar al menos una función." });
    }

    const created = await roleService.create({
      rolnom: rolnom.trim(),
      crebyid: req.user.EmpID,
      funcs,
    });

    res.status(201).json({ message: "Rol creado con éxito.", data: created });
  } catch (error) {
    console.error("Error al crear rol:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { rolnom, funcs } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de rol no válido." });
    }
    if (!rolnom || rolnom.trim() === "") {
      return res.status(400).json({ error: "rolnom es obligatorio." });
    }
    if (!Array.isArray(funcs) || funcs.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe asociar al menos una función." });
    }

    const updated = await roleService.update(id, {
      rolnom: rolnom.trim(),
      updbyid: req.user.EmpID,
      funcs,
    });

    if (!updated) return res.status(404).json({ error: "Rol no encontrado." });
    res.json({ message: "Rol actualizado con éxito.", data: updated });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

const deleteRole = async (req, res) => {
  try {
    const deleted = await roleService.deleteRole(req.params.id, req.user.EmpID);
    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Rol no encontrado o ya inactivo." });
    }
    res.json({ message: "Rol desactivado correctamente." });
  } catch (error) {
    console.error("Error al desactivar rol:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Error al desactivar rol." });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
