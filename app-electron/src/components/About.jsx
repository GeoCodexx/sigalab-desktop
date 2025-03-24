import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  Link,
} from "@mui/material";
import {
  Fingerprint,
  Security,
  Timeline,
  Code,
  Business,
  Email,
  Language,
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

const About = () => {
  return (
    <ScrollableContainer>
      <Box
        sx={{
          p: 3,
          maxWidth: 800,
          mx: "auto",
          /*bgcolor: "background.default",*/
          minHeight: "100vh",
          /*color: "text.primary",*/
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar
            src="/logo-app.png"
            sx={{
              width: 120,
              height: 120,
              mx: "auto",
              mb: 2,
              boxShadow: 3,
            }}
          />
          <Typography variant="h4" gutterBottom>
            BioAsistencia v2.1
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Sistema de Control de Asistencia Biométrico
          </Typography>
          <Chip
            label="Versión Estable"
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Fingerprint color="primary" sx={{ mr: 1 }} />
            Tecnología Utilizada
          </Typography>
          <Typography component="p">
            Nuestro sistema utiliza algoritmos de reconocimiento dactilar de
            última generación con una precisión del 99.7%. Todos los datos
            biométricos están encriptados con estándar AES-256.
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
            <Chip icon={<Security />} label="Datos encriptados" />
            <Chip icon={<Timeline />} label="Reportes en tiempo real" />
            <Chip icon={<Code />} label="API integrable" />
          </Box>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Información Legal
        </Typography>
        <Typography variant="body2" component="p">
          Este software cumple con todas las regulaciones locales de protección
          de datos biométricos. Los datos personales son procesados según la Ley
          de Protección de Datos Personales.
        </Typography>

        <List sx={{ mt: 3 }}>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Business />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="GeoCodexx Solutions S.A."
              secondary="Desarrolladores del sistema"
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Email />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="contacto@geocodexx-solutions.com"
              secondary="Correo corporativo"
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Language />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Link href="https://geocodexx.github.io/portfolio-project/" target="_blank">
                  www.geocodexx-solutions.com
                </Link>
              }
              secondary="Sitio web oficial"
            />
          </ListItem>
        </List>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="caption" display="block" color="text.secondary">
            © {new Date().getFullYear()} GeoCodexx Solutions. Todos los derechos
            reservados.
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Licencia válida hasta Diciembre 2025
          </Typography>
        </Box>
      </Box>
    </ScrollableContainer>
  );
};

export default About;
