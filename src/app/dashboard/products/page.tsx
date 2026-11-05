'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useDashboardUser } from '../dashboard-shell';
import {
  DEFAULT_PRODUCTS_PAGE_SIZE,
  useCreateProduct,
  useProducts,
} from '../../../services/products/products-queries';

export default function ProductsPage() {
  const user = useDashboardUser();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PRODUCTS_PAGE_SIZE);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const offset = page * rowsPerPage;
  const { data, error, isError, isFetching, isPending, refetch } = useProducts(
    user,
    offset,
    rowsPerPage
  );
  const createProduct = useCreateProduct(user);

  function closeCreateDialog() {
    if (!createProduct.isPending) {
      setIsCreateDialogOpen(false);
      createProduct.reset();
    }
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography component="h1" variant="h4">
          Productos
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            createProduct.reset();
            setIsCreateDialogOpen(true);
          }}
        >
          Crear producto
        </Button>
      </Box>

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error.message}
        </Alert>
      )}

      {isPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label="Cargando productos" />
        </Box>
      ) : (
        <>
          {isFetching && <CircularProgress size={20} sx={{ mb: 2 }} />}
          <Paper>
            <TableContainer>
              <Table aria-label="Productos">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell align="right">Existencia</TableCell>
                    <TableCell align="right">Precio unitario</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.products.length ? (
                    data.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.code ?? '—'}</TableCell>
                        <TableCell align="right">{product.stock ?? '—'}</TableCell>
                        <TableCell align="right">
                          {product.unitaryPrice === null
                            ? '—'
                            : product.unitaryPrice.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No hay productos para mostrar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={data?.totalOfProducts ?? 0}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              onPageChange={(_, selectedPage) => setPage(selectedPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number.parseInt(event.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
              getItemAriaLabel={(type) => {
                if (type === 'first') return 'Primera página';
                if (type === 'last') return 'Última página';
                if (type === 'next') return 'Página siguiente';
                return 'Página anterior';
              }}
              sx={{ borderTop: 1, borderColor: 'divider' }}
            />
          </Paper>
        </>
      )}

      <Dialog
        open={isCreateDialogOpen}
        onClose={closeCreateDialog}
        fullWidth
        maxWidth="sm"
        aria-labelledby="create-product-title"
      >
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const optionalString = (fieldName: string) => {
              const value = String(formData.get(fieldName) ?? '').trim();
              return value || undefined;
            };
            const optionalNumber = (fieldName: string) => {
              const value = String(formData.get(fieldName) ?? '').trim();
              return value ? Number(value) : undefined;
            };

            createProduct.mutate(
              {
                name: String(formData.get('name')).trim(),
                code: optionalString('code'),
                barcode: optionalString('barcode'),
                stock: optionalNumber('stock'),
                unitaryPrice: optionalNumber('unitaryPrice'),
                idealAmount: optionalNumber('idealAmount'),
                lowQuantity: optionalNumber('lowQuantity'),
              },
              {
                onSuccess: () => setIsCreateDialogOpen(false),
              }
            );
          }}
        >
          <DialogTitle id="create-product-title">Crear producto</DialogTitle>
          <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
            {createProduct.isError && <Alert severity="error">{createProduct.error.message}</Alert>}
            <TextField
              autoFocus
              required
              name="name"
              label="Nombre"
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
            <TextField name="code" label="Código" slotProps={{ htmlInput: { maxLength: 100 } }} />
            <TextField
              name="barcode"
              label="Código de barras"
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            <TextField
              name="unitaryPrice"
              label="Precio unitario"
              type="number"
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
            <TextField
              name="stock"
              label="Existencia"
              type="number"
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            <TextField
              name="idealAmount"
              label="Cantidad ideal"
              type="number"
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            <TextField
              name="lowQuantity"
              label="Cantidad baja"
              type="number"
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button type="button" onClick={closeCreateDialog} disabled={createProduct.isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={createProduct.isPending}>
              {createProduct.isPending ? 'Guardando...' : 'Guardar producto'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
