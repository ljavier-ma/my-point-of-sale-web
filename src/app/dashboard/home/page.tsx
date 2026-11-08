'use client';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useDashboardUser } from '../dashboard-shell';
import { useUserProfile } from '../../../services/user/user-queries';
import {
  useProductsBelowIdeal,
  useProductsWithLowQuantity,
} from '../../../services/products/products-queries';

export default function DashboardHomePage() {
  const user = useDashboardUser();
  const {
    data: profile,
    error: profileError,
    isPending: isProfilePending,
  } = useUserProfile(user);
  const {
    data: products,
    error: productsError,
    isError: isProductsError,
    isFetching: isFetchingProducts,
    isPending: areProductsPending,
    refetch: refetchProducts,
  } = useProductsBelowIdeal(user);
  const {
    data: lowQuantityProducts,
    error: lowQuantityError,
    isError: isLowQuantityError,
    isFetching: isFetchingLowQuantity,
    isPending: areLowQuantityProductsPending,
    refetch: refetchLowQuantityProducts,
  } = useProductsWithLowQuantity(user);

  return (
    <Box>
      {isProfilePending ? (
        <CircularProgress aria-label="Loading user name" />
      ) : profileError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {profileError.message}
        </Alert>
      ) : (
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
          ¡Hola, {profile.name}!
        </Typography>
      )}

      <Typography
        component="h2"
        variant="h5"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
      >
        <WarningAmberIcon color="warning" aria-hidden="true" />
        Productos por debajo de la cantidad ideal
      </Typography>

      {isProductsError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetchProducts()}>
              Reintentar
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {productsError.message}
        </Alert>
      )}

      {areProductsPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label="Cargando productos por debajo de la cantidad ideal" />
        </Box>
      ) : (
        <>
          {isFetchingProducts && <CircularProgress size={20} sx={{ mb: 2 }} />}
          <Paper>
            <TableContainer>
              <Table aria-label="Productos por debajo de la cantidad ideal">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell align="right">Existencia</TableCell>
                    <TableCell align="right">Cantidad ideal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products?.length ? (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.code ?? '—'}</TableCell>
                        <TableCell align="right">{product.stock ?? '—'}</TableCell>
                        <TableCell align="right">{product.idealAmount ?? '—'}</TableCell>
                      </TableRow>
                    ))
                  ) : isProductsError ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No se pudieron cargar los productos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No hay productos por debajo de la cantidad ideal.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      <Typography
        component="h2"
        variant="h5"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4, mb: 2 }}
      >
        <WarningAmberIcon color="error" aria-hidden="true" />
        Productos con cantidad baja
      </Typography>

      {isLowQuantityError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void refetchLowQuantityProducts()}
            >
              Reintentar
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {lowQuantityError.message}
        </Alert>
      )}

      {areLowQuantityProductsPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label="Cargando productos con cantidad baja" />
        </Box>
      ) : (
        <>
          {isFetchingLowQuantity && <CircularProgress size={20} sx={{ mb: 2 }} />}
          <Paper>
            <TableContainer>
              <Table aria-label="Productos con cantidad baja">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell align="right">Existencia</TableCell>
                    <TableCell align="right">Cantidad baja</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowQuantityProducts?.length ? (
                    lowQuantityProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.code ?? '—'}</TableCell>
                        <TableCell align="right">{product.stock ?? '—'}</TableCell>
                        <TableCell align="right">{product.lowQuantity ?? '—'}</TableCell>
                      </TableRow>
                    ))
                  ) : isLowQuantityError ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No se pudieron cargar los productos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No hay productos con cantidad baja.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}
