import { useState } from "react";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

const CustomAlert = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-blue-200 bg-blue-50 text-blue-800 shadow-lg max-w-md mx-auto"
    >
      <div className="flex items-start gap-2">
        <Info className="w-5 h-5 mt-0.5 text-blue-600" />
        <p className="text-sm">
          Please select your exact restaurant location on the map to ensure
          accurate directions.
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="mt-2 sm:mt-0 px-4 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        OK
      </button>
    </motion.div>
  );
};

export default CustomAlert;
