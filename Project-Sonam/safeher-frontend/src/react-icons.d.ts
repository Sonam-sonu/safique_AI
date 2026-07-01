// react-icons v5 removed className/style from IconBaseProps.
// This augmentation restores them so our existing JSX compiles cleanly.
import 'react-icons'

declare module 'react-icons' {
  interface IconBaseProps {
    className?: string
    style?: React.CSSProperties
    size?: string | number
    color?: string
    title?: string
    strokeWidth?: string | number
  }
}
