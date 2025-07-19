import { Link } from 'react-router-dom';

interface ProductItemProps {
  title: string;
  description: string;
  to: string;
  src: string;
}

export default function ProductItem({ title, description, to, src }: ProductItemProps) {
  return (
    <Link to={to} className="group block">
      <div className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <img
            src={src}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
} 