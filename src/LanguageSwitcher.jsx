import React from 'react';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

export default function LanguageSwitcher({ language, setLanguage }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <LanguageIcon />
        <Typography variant="caption" sx={{ ml: 1 }}>
          {language === 'fr' ? 'FR' : 'EN'}
        </Typography>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => changeLanguage('fr')} selected={language === 'fr'}>
          Français
        </MenuItem>
        <MenuItem onClick={() => changeLanguage('en')} selected={language === 'en'}>
          English
        </MenuItem>
      </Menu>
    </>
  );
}