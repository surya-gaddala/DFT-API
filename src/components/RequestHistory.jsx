// import React, { useState } from 'react';
// import { 
//   List, ListItem, ListItemText, IconButton, 
//   Typography, Divider, ListItemIcon, Tooltip, Box
// } from '@mui/material';
// import { 
//   History as HistoryIcon, 
//   Send as SendIcon
// } from '@mui/icons-material';

// const RequestHistory = ({ history, onSelect }) => {
//   const [hoveredItem, setHoveredItem] = useState(null);

//   if (!history || history.length === 0) {
//     return (
//       <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
//         No request history yet
//       </Typography>
//     );
//   }

//   return (
//     <List dense sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
//       {history.map((item) => (
//         <React.Fragment key={item.id}>
//           <ListItem
//             secondaryAction={
//               <Box sx={{ opacity: hoveredItem === item.id ? 1 : 0, transition: 'opacity 0.2s' }}>
//                 <Tooltip title="Resend">
//                   <IconButton 
//                     edge="end" 
//                     onClick={() => onSelect(item)}
//                     size="small"
//                   >
//                     <SendIcon fontSize="small" />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//             }
//             onMouseEnter={() => setHoveredItem(item.id)}
//             onMouseLeave={() => setHoveredItem(null)}
//             sx={{
//               '&:hover': { backgroundColor: 'action.hover' },
//               cursor: 'pointer',
//               pr: 6
//             }}
//             onClick={() => onSelect(item)}
//           >
//             <ListItemIcon sx={{ minWidth: 36 }}>
//               <HistoryIcon fontSize="small" />
//             </ListItemIcon>
//             <ListItemText
//               primary={
//                 <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
//                   {item.method} {item.url.slice(0, 30)}{item.url.length > 30 ? '...' : ''}
//                 </Typography>
//               }
//               secondary={
//                 <Typography variant="caption" color="text.secondary">
//                   {item.time}
//                 </Typography>
//               }
//             />
//           </ListItem>
//           <Divider component="li" />
//         </React.Fragment>
//       ))}
//     </List>
//   );
// };

// export default RequestHistory;

import React, { useState } from 'react';
import {
  List, ListItem, ListItemText, IconButton,
  Typography, Divider, ListItemIcon, Tooltip, Box
} from '@mui/material';
import {
  History as HistoryIcon,
  Send as SendIcon
} from '@mui/icons-material';
 
const RequestHistory = ({ history, onSelect }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
 
  if (!history || history.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No request history yet
      </Typography>
    );
  }
 
  return (
    <List dense sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
      {history.map((item) => (
        <React.Fragment key={item.id}>
          <ListItem
            secondaryAction={
              <Box sx={{ opacity: hoveredItem === item.id ? 1 : 0, transition: 'opacity 0.2s' }}>
                <Tooltip title="Resend">
                  <IconButton
                    edge="end"
                    onClick={() => onSelect(item)}
                    size="small"
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            sx={{
              '&:hover': { backgroundColor: 'action.hover' },
              cursor: 'pointer',
              pr: 6
            }}
            onClick={() => onSelect(item)}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {item.method} {item.url.slice(0, 30)}{item.url.length > 30 ? '...' : ''}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {item.time}
                </Typography>
              }
            />
          </ListItem>
          <Divider component="li" />
        </React.Fragment>
      ))}
    </List>
  );
};
 
export default RequestHistory;