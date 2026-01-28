/**
 * Wrapper around next/image that always uses unoptimized mode
 * This ensures images work correctly with VPS/Nginx reverse proxy
 */

import NextImage, { ImageProps } from 'next/image'

export default function Image(props: ImageProps) {
    return <NextImage {...props} unoptimized />
}

export { Image }
