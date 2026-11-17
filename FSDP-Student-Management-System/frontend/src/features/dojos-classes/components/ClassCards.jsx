import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
export default function ClassCards({ classes }) {
  return (
    <div className="class-grid">
      {classes.map((item) => (
        <Link className="class-card" to={`/classes/${item.id}`} key={item.id}>
          <div className="class-photo">
            <img
              src="/assets/photos/aikido-training.jpg"
              alt="Illustrative Aikido training in Japan, by Ignat Gorazd; not ASK members"
              loading="lazy"
            />
            <span>DEMO PROGRAMME</span>
          </div>
          <div className="class-copy">
            <div className="row spread">
              <h3>{item.name}</h3>
              <ArrowUpRight size={21} />
            </div>
            <p>{item.description}</p>
            <small>
              AGES {item.minAge}–{item.maxAge} ·{' '}
              {item.minBelt ? 'VERIFIED RANK REQUIRED' : 'BEGINNERS WELCOME'}
            </small>
          </div>
        </Link>
      ))}
    </div>
  );
}
