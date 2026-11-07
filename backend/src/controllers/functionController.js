// src/controllers/functionController.js
const functionService = require("../services/functionService");

const getAllFunctions = async (req, res) => {
  try {
    const functions = await functionService.getAll();
    res.json(functions);
  } catch (error) {
    console.error("Error al obtener funciones:", error);
    res.status(500).json({ error: "Error al obtener funciones." });
  }
};

const getFunctionById = async (req, res) => {
  try {
    const func = await functionService.getById(req.params.id);
    if (!func) {
      return res.status(404).json({ error: "Función no encontrada." });
    }
    res.json(func);
  } catch (error) {
    console.error("Error al obtener función:", error);
    res.status(500).json({ error: "Error al obtener función." });
  }
};

const createFunction = async (req, res) => {
  try {
    const { funnom, fundes, ventanas } = req.body;

    // Validação: nome obrigatório + ao menos uma view
    if (!funnom || typeof funnom !== "string" || funnom.trim() === "") {
      return res.status(400).json({ error: "funnom es obligatorio." });
    }
    if (!Array.isArray(ventanas) || ventanas.length === 0) {
      return res.status(400).json({ error: "Debe asociar al menos una view." });
    }

    const created = await functionService.create({
      funnom: funnom.trim(),
      fundes: fundes?.trim() || null,
      crebyid: req.user.EmpID, // vem do JWT, nunca do body
      ventanas,
    });

    res
      .status(201)
      .json({ message: "Función creada con éxito.", data: created });
  } catch (error) {
    console.error("Error al crear función:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

const updateFunction = async (req, res) => {
  try {
    const { id } = req.params;
    const { funnom, fundes, ventanas } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de función no válido." });
    }
    if (!funnom || typeof funnom !== "string" || funnom.trim() === "") {
      return res.status(400).json({ error: "funnom es obligatorio." });
    }
    if (!Array.isArray(ventanas) || ventanas.length === 0) {
      return res.status(400).json({ error: "Debe asociar al menos una view." });
    }

    const updated = await functionService.update(id, {
      funnom: funnom.trim(),
      fundes: fundes?.trim() || null,
      updbyid: req.user.EmpID,
      ventanas,
    });

    if (!updated) {
      return res.status(404).json({ error: "Función no encontrada." });
    }

    res.json({ message: "Función actualizada con éxito.", data: updated });
  } catch (error) {
    console.error("Error al actualizar función:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

const deleteFunction = async (req, res) => {
  try {
    const { id } = req.params;
    const updbyid = req.user.EmpID;

    const deleted = await functionService.deleteFunction(id, updbyid);
    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Función no encontrada o ya inactiva." });
    }

    res.json({ message: "Función desactivada correctamente." });
  } catch (error) {
    console.error("Error al desactivar función:", error);
    const status = error.status || 500;
    res
      .status(status)
      .json({ error: error.message || "Error al desactivar función." });
  }
};

module.exports = {
  getAllFunctions,
  getFunctionById,
  createFunction,
  updateFunction,
  deleteFunction,
};
