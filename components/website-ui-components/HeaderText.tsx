import React from 'react'

interface HeaderTextProps {
  title: string;
  subtitle: string;
  alignment?: 'left' | 'right' | 'center';
  actionButtonText?: string;
  onActionClick?: () => void;
  actionContent?: React.ReactNode;
}

const HeaderText = ({ title, subtitle, alignment = 'center', actionButtonText, onActionClick, actionContent }: HeaderTextProps) => {
  return (
    <div className={`header-text-container header-text-container--${alignment}`}>
      <div className="header-text-content">
        <span className='subtitle-header-text'>{subtitle}</span>
        <h2 className='header-text'>{title}</h2>
      </div>
      {(actionContent || actionButtonText) && (
        <div className="header-text-action">
          {actionContent ? (
            actionContent
          ) : actionButtonText ? (
            <button 
              className="header-text-button"
              onClick={onActionClick}
            >
              {actionButtonText}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default HeaderText