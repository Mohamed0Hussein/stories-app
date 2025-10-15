import React from 'react'

type ButtonProps = {
    component?: React.ElementType,
    className?: string,
    children?: React.ReactNode
} & React.ComponentPropsWithoutRef<'button'>

const Button = ({ 
    component: Component = 'button', 
    className = '', 
    children = 'Button',
    ...rest
}: ButtonProps) => {
    return <Component className={className} {...rest}>{children}</Component>
}

export default Button