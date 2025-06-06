import TopHeader from '@/components/organisms/TopHeader'
      import MainFeatureSection from '@/components/organisms/MainFeatureSection'
      import QuickStatsSection from '@/components/organisms/QuickStatsSection'
      import FeaturesGrid from '@/components/organisms/FeaturesGrid'
      
      const HomePage = ({ isDarkMode, setIsDarkMode }) => {
        return (
          &lt;div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800 transition-all duration-500"&gt;
            &lt;TopHeader isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /&gt;
      
            &lt;main className="relative"&gt;
              &lt;MainFeatureSection /&gt;
              &lt;QuickStatsSection /&gt;
              &lt;FeaturesGrid /&gt;
            &lt;/main&gt;
          &lt;/div&gt;
        )
      }
      
      export default HomePage