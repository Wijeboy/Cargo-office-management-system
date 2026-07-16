import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllConfigs = async (req, res) => {
  try {
    const configs = await prisma.applicationConfig.findMany({
      orderBy: { key: 'asc' },
    });
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const config = await prisma.applicationConfig.findUnique({ where: { key } });
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Config not found' });
    }
    
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, type } = req.body;
    
    const config = await prisma.applicationConfig.upsert({
      where: { key },
      update: { value: String(value), type: type || 'string' },
      create: { key, value: String(value), type: type || 'string' },
    });

    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteConfig = async (req, res) => {
  try {
    const { key } = req.params;
    await prisma.applicationConfig.delete({ where: { key } });
    res.json({ success: true, message: 'Config deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
