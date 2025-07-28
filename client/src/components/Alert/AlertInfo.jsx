import { Info } from "lucide-react"; // optional icon library
import { motion } from "framer-motion"; // for animation

const AlertInfo = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start gap-3 p-4 rounded-2xl border border-blue-200 bg-blue-50 text-blue-800 shadow-md"
  >
    <Info className="w-5 h-5 mt-0.5 text-blue-600" />
    <p className="text-sm">
      Please select your exact restaurant location on the map to ensure accurate
      directions.
    </p>
  </motion.div>
);

export default AlertInfo;
