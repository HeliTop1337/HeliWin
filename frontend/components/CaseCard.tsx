import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { getImageUrl } from '../lib/imageUrl';

interface CaseCardProps {
  caseData: {
    id: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    icon: string;
  };
}

export default function CaseCard({ caseData }: CaseCardProps) {
  const router = useRouter();
  const finalPrice = caseData.price * (1 - caseData.discount / 100);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass rounded-2xl overflow-hidden cursor-pointer group relative"
      onClick={() => router.push(`/cases/${caseData.id}`)}
    >
      {/* Discount badge */}
      {caseData.discount > 0 && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-4 right-4 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
        >
          -{caseData.discount}%
        </motion.div>
      )}

      {/* Icon container */}
      <div className="aspect-square bg-background/50 flex items-center justify-center overflow-hidden relative">
        {caseData.icon ? (
          <img 
            src={getImageUrl(caseData.icon)} 
            alt={caseData.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Fallback to SVG icon if image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('class', 'w-32 h-32 text-primary drop-shadow-lg');
                svg.setAttribute('fill', 'currentColor');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.innerHTML = '<path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>';
                parent.appendChild(svg);
              }
            }}
          />
        ) : (
          <div className="w-32 h-32">
            <svg className="w-full h-full text-primary drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Case info */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {caseData.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[40px]">
          {caseData.description || 'Откройте кейс и получите случайный предмет'}
        </p>

        {/* Price section */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex flex-col">
            {caseData.discount > 0 && (
              <span className="text-muted-foreground line-through text-sm">
                {caseData.price.toFixed(2)} ₽
              </span>
            )}
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {finalPrice.toFixed(2)} ₽
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
