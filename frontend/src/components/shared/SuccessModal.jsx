import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { CheckCircle, Play, X } from 'lucide-react';
import { useWindowSize } from 'react-use'; // Optional: npm install react-use

const SuccessModal = ({ isOpen, onClose, courseTitle }) => {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000); // Stop after 5s
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={400} colors={['#2D6A9F', '#9DE38D', '#ffffff']} />}
      
      <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <div className="w-20 h-20 bg-green-100 text-olg-green rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-2">You're In!</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Congratulations! You've successfully unlocked <span className="text-olg-blue font-bold">{courseTitle}</span>. Your journey to impact starts now.
        </p>

        <div className="space-y-3">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-olg-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-olg-dark transition-all shadow-lg shadow-olg-blue/20"
          >
            <Play size={18} /> Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;