import { motion } from 'framer-motion';

const FloatingBooks = () => {
  // Book animation variants
  const bookVariants = {
    initial: { 
      y: 0,
      rotate: 0,
      scale: 1
    },
    animate: (i) => ({
      y: [0, -20, 0],
      rotate: [0, 5, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 3 + i,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  };

  // Book data with genres and colors
  const books = [
    { 
      genre: 'FANTASY',
      color: '#5199fc',
      x: '10%',
      y: '20%',
      delay: 0,
      spineColor: '#3a7bd5'
    },
    { 
      genre: 'ROMANCE',
      color: '#ff69b4',
      x: '80%',
      y: '30%',
      delay: 0.5,
      spineColor: '#e55c9f'
    },
    { 
      genre: 'MYSTERY',
      color: '#ffd700',
      x: '30%',
      y: '60%',
      delay: 1,
      spineColor: '#e6c300'
    },
    { 
      genre: 'SCI-FI',
      color: '#ff5068',
      x: '70%',
      y: '50%',
      delay: 1.5,
      spineColor: '#e63c54'
    },
    { 
      genre: 'HORROR',
      color: '#da70d6',
      x: '40%',
      y: '80%',
      delay: 2,
      spineColor: '#c45cc0'
    }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {books.map((book, i) => (
        <motion.div
          key={i}
          className="absolute w-16 h-24 rounded-lg shadow-lg"
          style={{
            backgroundColor: book.color,
            left: book.x,
            top: book.y,
            transform: 'rotate(15deg)'
          }}
          variants={bookVariants}
          initial="initial"
          animate="animate"
          custom={i}
        >
          {/* Book spine */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-2 rounded-l-lg"
            style={{ backgroundColor: book.spineColor }}
          />
          
          {/* Book cover content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
            <div className="w-full h-1 bg-white/20 rounded-full mb-1" />
            <div className="w-full h-1 bg-white/20 rounded-full mb-1" />
            <div className="w-full h-1 bg-white/20 rounded-full" />
          </div>
          
          {/* Genre text */}
          <div 
            className="absolute -right-1 top-1/2 -translate-y-1/2 transform -rotate-90 origin-left"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            <span className="text-[8px] font-bold tracking-widest text-white uppercase">
              {book.genre}
            </span>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-white/20" />
          <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-white/20" />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingBooks; 