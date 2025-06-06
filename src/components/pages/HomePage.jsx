import TopHeader from '@/components/organisms/TopHeader'
      import MainFeatureSection from '@/components/organisms/MainFeatureSection'
      import QuickStatsSection from '@/components/organisms/QuickStatsSection'
      import FeaturesGrid from '@/components/organisms/FeaturesGrid'
      
const HomePage = ({ isDarkMode, setIsDarkMode }) => {
        return (
          <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800 transition-all duration-500">
            <TopHeader isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
            <main className="relative">
              <MainFeatureSection />
              <QuickStatsSection />
              <FeaturesGrid />
            </main>
          </div>
        )
      }
      
      export default HomePage