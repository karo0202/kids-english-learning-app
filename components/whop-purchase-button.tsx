'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Crown, ExternalLink, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface WhopPurchaseButtonProps {
  productUrl?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export default function WhopPurchaseButton({
  productUrl,
  className = '',
  variant = 'default',
  size = 'default',
}: WhopPurchaseButtonProps) {
  const [loading, setLoading] = useState(false)

  // Default Whop product URL - replace with your actual Whop product URL
  const defaultProductUrl = process.env.NEXT_PUBLIC_WHOP_PRODUCT_URL || 'https://whop.com/your-product'

  const handlePurchase = () => {
    setLoading(true)
    const url = productUrl || defaultProductUrl
    
    // Open Whop product page in new tab
    window.open(url, '_blank', 'noopener,noreferrer')
    
    // Reset loading after a delay
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        onClick={handlePurchase}
        disabled={loading}
        variant={variant}
        size={size}
        className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Opening...
          </>
        ) : (
          <>
            <Crown className="w-4 h-4 mr-2" />
            Get Premium Access
            <ExternalLink className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </motion.div>
  )
}

