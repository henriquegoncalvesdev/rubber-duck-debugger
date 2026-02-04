import React from 'react';
import { Bot, GraduationCap, Code2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PersonaType = 'senior' | 'academic' | 'duck' | 'doc_writer';

interface PersonaAvatarProps {
    persona: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const personas: Record<string, { label: string, icon: React.ElementType, color: string, bgColor: string }> = {
    senior: {
        label: "Senior Developer",
        icon: Code2,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10"
    },
    academic: {
        label: "Academic Professor",
        icon: GraduationCap,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10"
    },
    duck: {
        label: "Rubber Duck",
        icon: Bot,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10"
    },
    doc_writer: {
        label: "Technical Writer",
        icon: FileText,
        color: "text-green-500",
        bgColor: "bg-green-500/10"
    }
};

const PersonaAvatar: React.FC<PersonaAvatarProps> = ({ persona, className, size = 'md' }) => {
    const p = personas[persona] || personas.senior;
    const Icon = p.icon;

    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-6 h-6"
    };

    return (
        <div className={cn(
            "rounded-full flex items-center justify-center border",
            p.bgColor,
            p.color,
            "border-current/20",
            sizeClasses[size],
            className
        )}>
            <Icon className={iconSizes[size]} />
        </div>
    );
};

export default PersonaAvatar;
