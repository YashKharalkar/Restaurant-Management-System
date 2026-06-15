import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faLeaf, faAward, faUsers } from '@fortawesome/free-solid-svg-icons';

const About = () => {
  const timings = [
    { day: 'Monday – Friday', time: '11:00 AM – 11:00 PM' },
    { day: 'Saturday', time: '10:00 AM – 11:30 PM' },
    { day: 'Sunday', time: '10:00 AM – 10:00 PM' },
  ];

  const values = [
    { icon: faHeart, title: 'Passion', desc: 'Every dish is made with love and dedication to quality.' },
    { icon: faLeaf, title: 'Fresh Ingredients', desc: 'We source locally grown, seasonal, and organic ingredients.' },
    { icon: faAward, title: 'Excellence', desc: 'Award-winning recipes perfected over two decades.' },
    { icon: faUsers, title: 'Community', desc: 'A place where family and friends gather to celebrate life.' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(14,77,100,0.80) 0%, rgba(26,127,168,0.72) 100%),
            url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85')
          `,
        }}
      >
        <h1>About Us</h1>
        <p>Our story, our values, and our promise to you</p>
      </div>

      {/* Story Section */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-img">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop"
                alt="Restaurant interior"
                style={{ width: '100%', height: '380px', objectFit: 'cover' }}
              />
            </div>
            <div className="about-text">
              <h2>Our Story</h2>
              <p>
                Founded in 2005, The Grand Table began as a small family restaurant
                with a simple dream — to bring people together through extraordinary food.
                What started as a 10-table eatery has grown into one of the most beloved
                dining destinations in the city.
              </p>
              <p>
                Our chef, with over 20 years of culinary experience, brings together
                traditional recipes and modern techniques to create dishes that are both
                familiar and exciting. Every meal we serve is a celebration of culture,
                community, and craftsmanship.
              </p>
              <p>
                We believe great food is more than sustenance — it's a shared experience,
                a memory in the making. Come, pull up a chair. The Grand Table is yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Opening Timings */}
      <section className="section" style={{ backgroundColor: '#f5f9fb' }}>
        <div className="container">
          <h2 className="section-title">Opening Hours</h2>
          <p className="section-subtitle">We're here when you're hungry</p>
          <div className="timings-grid">
            {timings.map((t) => (
              <div key={t.day} className="timing-card">
                <h4>{t.day}</h4>
                <p>{t.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <p className="section-subtitle">What drives everything we do</p>
          <div className="values-grid">
            {values.map((v) => (
              <div key={v.title} className="value-card">
                <div className="value-icon">
                  <FontAwesomeIcon icon={v.icon} />
                </div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
