import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNavbar from '../components/layout/BottomNavbar';

/**
 * PlaceholderPage Component
 * Clean layout wrapper for secondary dashboard sections (Explore, Communities, Projects, Events, Messages, Profile).
 *
 * @param {Object} props
 * @param {string} props.title - Title of the section
 * @param {string} props.description - Brief description
 * @param {React.ElementType} [props.icon] - Lucide icon component
 */
const PlaceholderPage = ({ title, description, icon: Icon }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#17233B] flex flex-col antialiased selection:bg-[#5277D9] selection:text-white">
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar */}
          <div className="hidden md:block md:col-span-3 lg:col-span-3 sticky top-22">
            <Sidebar />
          </div>

          {/* Center Content Placeholder */}
          <div className="col-span-12 md:col-span-9 lg:col-span-9">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 sm:p-12 text-center shadow-xs">
              {Icon && (
                <div className="w-14 h-14 rounded-2xl bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7" />
                </div>
              )}
              <h1 className="text-2xl font-bold text-[#17233B] tracking-tight">{title}</h1>
              <p className="mt-2 text-sm text-[#667085] max-w-md mx-auto">{description}</p>
              <div className="mt-6 inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#E8EDF7] text-[#5277D9] text-xs font-semibold">
                Section in Active Development
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
};

export default PlaceholderPage;
