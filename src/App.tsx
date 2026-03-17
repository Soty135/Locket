import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ValuationSection from './components/ValuationSection';
import SecureHandover from './components/SecureHandover';
import ProcessSteps from './components/ProcessSteps';
import DeviceGrid from './components/DeviceGrid';
import FairPlayPolicy from './components/FairPlayPolicy';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ValuationSection />
        <SecureHandover />
        <ProcessSteps />
        <DeviceGrid />
        <FairPlayPolicy />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

export default App;
