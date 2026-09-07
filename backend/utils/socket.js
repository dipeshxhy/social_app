let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
  return ioInstance;
};

export const getIO = () => ioInstance;
