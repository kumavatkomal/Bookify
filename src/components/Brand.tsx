'use client'

import Image from 'next/image'
import Link from 'next/link'
import { clsx } from 'clsx'

type BrandProps = {
  size?: number
  showText?: boolean
  href?: string
  className?: string
}

export default function Brand({
  size = 36,
  showText = true,
  href = '/',
  className,
}: BrandProps) {
  const content = (
    <div className={clsx('flex items-center gap-2', className)}>
      <Image
        src="/bookify.png"
        alt="Bookify logo"
        width={size}
        height={size}
        priority={size >= 64}
        className="rounded-xl"
      />
      {showText && (
        <span className="text-xl font-semibold text-gray-900">Bookify</span>
      )}
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}
