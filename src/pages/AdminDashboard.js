import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';

// Importar los componentes de gestión
import PeriodManagement from '../components/admin/PeriodManagement';
import SubjectManagement from '../components/admin/SubjectManagement';
import CourseManagement from '../components/admin/CourseManagement';
import GroupManagement from '../components/admin/GroupManagement';

// Panel de contenido para cada pestaña
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openTeacherModal, setOpenTeacherModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    user: {
      username: '',
      email: '',
      password: '',
    },
    teacher_code: '',
    ci: '',
    first_name: '',
    last_name: '',
    phone: '',
    birth_date: '',
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [openAlert, setOpenAlert] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Obtener usuarios con sus perfiles incluidos gracias a los cambios en el backend
      const usersData = await userService.getAllUsers();
      console.log("Datos de usuarios recibidos:", usersData);
      setUsers(usersData);
      
      setError(null);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error("Error en fetchUsers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para obtener el nombre y apellido de un usuario
  const getUserName = (user) => {
    if (user.teacher_profile) {
      return user.teacher_profile.first_name || '';
    } else if (user.student_profile) {
      return user.student_profile.first_name || '';
    }
    return '';
  };

  // Función auxiliar para obtener el apellido de un usuario
  const getUserLastName = (user) => {
    if (user.teacher_profile) {
      return user.teacher_profile.last_name || '';
    } else if (user.student_profile) {
      return user.student_profile.last_name || '';
    }
    return '';
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenTeacherModal = () => {
    setOpenTeacherModal(true);
  };

  const handleCloseTeacherModal = () => {
    setOpenTeacherModal(false);
  };

  const handleOpenEditModal = (user) => {
    setCurrentUser(user);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setCurrentUser(null);
  };

  const handleTeacherInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewTeacher({
        ...newTeacher,
        [parent]: {
          ...newTeacher[parent],
          [child]: value,
        },
      });
    } else {
      setNewTeacher({
        ...newTeacher,
        [name]: value,
      });
    }
  };
  
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: value,
    });
  };

  const handleCreateTeacher = async () => {
    try {
      await userService.createTeacher(newTeacher);
      
      // Recargar la lista de usuarios
      fetchUsers();
      handleCloseTeacherModal();
      // Mostrar alerta de éxito
      setAlertMessage('Profesor creado correctamente');
      setAlertSeverity('success');
      setOpenAlert(true);
      // Resetear el formulario
      setNewTeacher({
        user: {
          username: '',
          email: '',
          password: '',
        },
        teacher_code: '',
        ci: '',
        first_name: '',
        last_name: '',
        phone: '',
        birth_date: '',
      });
    } catch (err) {
      setAlertMessage('Error al crear el profesor');
      setAlertSeverity('error');
      setOpenAlert(true);
      console.error(err);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await userService.updateUser(currentUser.id, currentUser);
      fetchUsers();
      handleCloseEditModal();
      setAlertMessage('Usuario actualizado correctamente');
      setAlertSeverity('success');
      setOpenAlert(true);
    } catch (err) {
      setAlertMessage('Error al actualizar el usuario');
      setAlertSeverity('error');
      setOpenAlert(true);
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
        setAlertMessage('Usuario eliminado correctamente');
        setAlertSeverity('success');
        setOpenAlert(true);
      } catch (err) {
        setAlertMessage('Error al eliminar el usuario');
        setAlertSeverity('error');
        setOpenAlert(true);
        console.error(err);
      }
    }
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleNavigateToClasses = () => {
    navigate('/classes');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Panel de Administrador
        </Typography>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Gestionar Usuarios" />
            <Tab label="Gestionar Periodos" />
            <Tab label="Gestionar Materias" />
            <Tab label="Gestionar Cursos" />
            <Tab label="Gestionar Grupos" />
            <Tab label="Gestionar Clases" />
            <Tab label="Bitácora" />
          </Tabs>

          {/* Panel de Gestionar Usuarios */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleOpenTeacherModal}
              >
                Agregar Profesor
              </Button>
            </Box>
            
            {loading ? (
              <Typography>Cargando usuarios...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Apellido</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{getUserName(user)}</TableCell>
                        <TableCell>{getUserLastName(user)}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.user_type}</TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenEditModal(user)}
                            sx={{ mr: 1 }}
                          >
                            Editar
                          </Button>
                          <Button 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Panel de Gestionar Periodos */}
          <TabPanel value={tabValue} index={1}>
            <PeriodManagement />
          </TabPanel>

          {/* Panel de Gestionar Materias */}
          <TabPanel value={tabValue} index={2}>
            <SubjectManagement />
          </TabPanel>
          
          {/* Panel de Gestionar Cursos */}
          <TabPanel value={tabValue} index={3}>
            <CourseManagement />
          </TabPanel>
          
          {/* Panel de Gestionar Grupos */}
          <TabPanel value={tabValue} index={4}>
            <GroupManagement />
          </TabPanel>
          
          {/* Panel de Gestionar Clases */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Gestión de Clases
              </Typography>
              <Typography paragraph>
                Desde aquí puede acceder a la administración de clases donde podrá ver, crear, editar y eliminar clases, así como gestionar los alumnos asignados a cada clase.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleNavigateToClasses}
                sx={{ mt: 2 }}
              >
                Ir a Gestión de Clases
              </Button>
            </Box>
          </TabPanel>
          
          {/* Panel de Bitácora */}
          <TabPanel value={tabValue} index={6}>
            <Typography>Bitácora - En construcción</Typography>
          </TabPanel>
        </Paper>
      </Box>

      {/* Modal para crear profesor */}
      <Dialog open={openTeacherModal} onClose={handleCloseTeacherModal} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Profesor</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Datos de usuario
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Usuario"
                  name="user.username"
                  value={newTeacher.user.username}
                  onChange={handleTeacherInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Email"
                  name="user.email"
                  value={newTeacher.user.email}
                  onChange={handleTeacherInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="user.password"
                  type="password"
                  value={newTeacher.user.password}
                  onChange={handleTeacherInputChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Datos del profesor
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Código de profesor"
                  name="teacher_code"
                  value={newTeacher.teacher_code}
                  onChange={handleTeacherInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CI"
                  name="ci"
                  value={newTeacher.ci}
                  onChange={handleTeacherInputChange}
                  margin="normal"
                />
              </Grid>
              
              {/* Nuevos campos de nombre y apellido */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="first_name"
                  value={newTeacher.first_name}
                  onChange={handleTeacherInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  name="last_name"
                  value={newTeacher.last_name}
                  onChange={handleTeacherInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={newTeacher.phone}
                  onChange={handleTeacherInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha de nacimiento"
                  name="birth_date"
                  type="date"
                  value={newTeacher.birth_date}
                  onChange={handleTeacherInputChange}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTeacherModal}>Cancelar</Button>
          <Button onClick={handleCreateTeacher} variant="contained" color="primary">
            Crear Profesor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para editar usuario */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          {currentUser && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Usuario"
                name="username"
                value={currentUser.username}
                onChange={handleUserInputChange}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={currentUser.email}
                onChange={handleUserInputChange}
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo de usuario</InputLabel>
                <Select
                  name="user_type"
                  value={currentUser.user_type}
                  onChange={handleUserInputChange}
                  label="Tipo de usuario"
                >
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="teacher">Profesor</MenuItem>
                  <MenuItem value="student">Alumno</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancelar</Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alerta */}
      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;