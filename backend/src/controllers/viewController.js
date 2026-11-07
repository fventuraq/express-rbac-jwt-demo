// src/controllers/viewController.js
const viewService = require("../services/viewService");

const getAllViews = async (req, res) => {
  try {
    const result = await viewService.getAllViews();
    res.json(result);
  } catch (error) {
    console.error("Erro ao obter views:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

const getViewById = async (req, res) => {
  try {
    const result = await viewService.getViewById(req.params.id);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.json(result);
  } catch (error) {
    console.error("Erro ao obter view:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

const createView = async (req, res) => {
  try {
    const result = await viewService.createView(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao criar view:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

const updateView = async (req, res) => {
  try {
    const result = await viewService.updateView(req.params.id, req.body);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.json(result);
  } catch (error) {
    console.error("Erro ao atualizar view:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

const deleteView = async (req, res) => {
  try {
    const result = await viewService.deleteView(req.params.id, req.body);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.json(result);
  } catch (error) {
    console.error("Erro ao desativar view:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

module.exports = {
  getAllViews,
  getViewById,
  createView,
  updateView,
  deleteView,
};
