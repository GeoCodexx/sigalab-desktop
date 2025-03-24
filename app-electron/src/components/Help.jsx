import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Paper,
} from "@mui/material";
import {
  ExpandMore,
  Fingerprint,
  Schedule,
  ErrorOutline,
  Person,
  Settings,
  CloudUpload,
  HelpOutline,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const ScrollableContainer = styled("div")(({ theme }) => ({
  maxHeight: "calc(100vh - 100px)", // Ajusta según tu layout
  overflowY: "auto",
  scrollbarWidth: "thin",
  scrollbarColor: `${theme.palette.grey[700]} ${theme.palette.background.default}`,
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.background.default,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.grey[700],
    borderRadius: "4px",
    border: `2px solid ${theme.palette.background.default}`,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: theme.palette.grey[600],
  },
}));

const Help = () => {
  const [expanded, setExpanded] = useState("panel1"); // Panel inicial abierto

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };
  return (
    <ScrollableContainer>
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 3, display: "flex", alignItems: "center" }}
        >
          <HelpOutline color="teallight" sx={{ mr: 2 }} />
          Centro de Ayuda
        </Typography>

        <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" color="white">
            Sistema de Registro Biométrico v2.1
          </Typography>
          <Typography color="white">
            Guía rápida para el uso del sistema de asistencia por huella
            dactilar
          </Typography>
        </Paper>

        <Accordion
          expanded={expanded === "panel1"}
          onChange={handleChange("panel1")}
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: "white" }} />}>
            <Typography sx={{ fontWeight: "bold" }}>
              Registro de Asistencia
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Fingerprint color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Cómo registrar mi huella"
                  secondary="Coloque su dedo índice firmemente sobre el lector hasta escuchar el tono de confirmación"
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemIcon>
                  <Schedule color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Horarios y tolerancia"
                  secondary="La tolerancia para marcación es de 10 minutos. Después se considera tardanza"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expanded === "panel2"}
          onChange={handleChange("panel2")}
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: "white" }} />}>
            <Typography sx={{ fontWeight: "bold" }}>
              Solución de Problemas
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <ErrorOutline color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="El lector no reconoce mi huella"
                  secondary={
                    <>
                      <Box component="span" display="block">
                        1. Limpie el sensor con un paño suave
                      </Box>
                      <Box component="span" display="block">
                        2. Asegúrese que su dedo esté limpio y seco
                      </Box>
                      <Box component="span" display="block">
                        3. Registre la misma huella en múltiples ángulos
                      </Box>
                    </>
                  }
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expanded === "panel3"}
          onChange={handleChange("panel3")}
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: "white" }} />}>
            <Typography sx={{ fontWeight: "bold" }}>Administración</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>Para administradores del sistema:</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              <Chip
                icon={<Person />}
                label="Agregar usuarios"
                variant="outlined"
              />
              <Chip
                icon={<Settings />}
                label="Configurar dispositivos"
                variant="outlined"
              />
              <Chip
                icon={<CloudUpload />}
                label="Exportar reportes"
                variant="outlined"
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            ¿No encontró lo que necesitaba? Contacte al soporte técnico:
            soporte@asistenciabiometrica.com
          </Typography>
        </Box>
      </Box>
    </ScrollableContainer>
  );
};

export default Help;
