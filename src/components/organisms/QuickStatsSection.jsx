import { motion } from 'framer-motion'
      import StatCard from '@/components/molecules/StatCard'
      
      const stats = [
        { iconName: "Users", iconClass: "text-primary", value: "50K+", label: "Active Users" },
        { iconName: "MapPin", iconClass: "text-accent", value: "10+", label: "Cities" },
        { iconName: "Clock", iconClass: "text-green-500", value: "2 min", label: "Avg Wait" },
        { iconName: "Star", iconClass: "text-yellow-500", value: "4.8", label: "Rating" }
      ]
      
      const QuickStatsSection = () => {
        return (
          &lt;motion.section 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          &gt;
            &lt;div className="grid grid-cols-2 md:grid-cols-4 gap-4"&gt;
              {stats.map((stat, index) => (
                &lt;StatCard 
                  key={index}
                  iconName={stat.iconName}
                  iconClass={stat.iconClass}
                  value={stat.value}
                  label={stat.label}
                /&gt;
              ))}
            &lt;/div&gt;
          &lt;/motion.section&gt;
        )
      }
      
      export default QuickStatsSection