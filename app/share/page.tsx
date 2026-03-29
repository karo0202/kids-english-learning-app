import type { Metadata } from 'next'
import SocialShareQr from '@/components/social-share-qr'

export const metadata: Metadata = {
  title: 'Share Kids English | QR code',
  description: 'Download a QR code with the Kids English icon to share the app on social media.',
  openGraph: {
    title: 'Share Kids English',
    description: 'Scan or download the QR code to open the app.',
  },
}

export default function SharePage() {
  return <SocialShareQr />
}
