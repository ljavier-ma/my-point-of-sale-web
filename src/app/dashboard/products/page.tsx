'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useDashboardUser } from '../dashboard-shell';
import {
  DEFAULT_PRODUCTS_PAGE_SIZE,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from '../../../services/products/products-queries';
import { useUserStore } from '../../../services/user/user-queries';
import type { Product, ProductFields } from '../../../services/products/products-service';

function ProductInputFields({ product }: { product?: Product | null }) {
  return (
    <>
      <TextField
        autoFocus={!product}
        required
        name="name"
        label="Nombre"
        defaultValue={product?.name ?? ''}
        slotProps={{ htmlInput: { maxLength: 200 } }}
      />
      <TextField
        name="code"
        label="Código"
        defaultValue={product?.code ?? ''}
        slotProps={{ htmlInput: { maxLength: 100 } }}
      />
      <TextField
        name="barcode"
        label="Código de barras"
        defaultValue={product?.barcode ?? ''}
        slotProps={{ htmlInput: { maxLength: 100 } }}
      />
      <TextField
        name="unitaryPrice"
        label="Precio unitario"
        type="number"
        defaultValue={product?.unitaryPrice ?? ''}
        slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
      />
      <TextField
        name="stock"
        label="Existencia"
        type="number"
        defaultValue={product?.stock ?? ''}
        slotProps={{ htmlInput: { min: 0, step: 1 } }}
      />
      <TextField
        name="baseStockAmount"
        label="Cantidad base"
        type="number"
        defaultValue={product?.baseStockAmount ?? ''}
        slotProps={{ htmlInput: { min: 0, step: 1 } }}
      />
    </>
  );
}

function getProductFields(formData: FormData): ProductFields {
  const stringField = (fieldName: string) => String(formData.get(fieldName) ?? '').trim();
  const numberField = (fieldName: string) => {
    const value = String(formData.get(fieldName) ?? '').trim();
    return value ? Number(value) : 0;
  };

  return {
    name: stringField('name'),
    code: stringField('code'),
    barcode: stringField('barcode'),
    unitaryPrice: numberField('unitaryPrice'),
    stock: numberField('stock'),
    baseStockAmount: numberField('baseStockAmount'),
  };
}

function getStockWarningColor(
  product: Product,
  idealPercentage: number,
  lowPercentage: number
): 'warning' | 'error' | null {
  if (product.stock === null || product.baseStockAmount === null || product.baseStockAmount <= 0) {
    return null;
  }

  const stockPercentage = (product.stock / product.baseStockAmount) * 100;

  if (stockPercentage < lowPercentage) {
    return 'error';
  }

  if (stockPercentage < idealPercentage) {
    return 'warning';
  }

  return null;
}

export default function ProductsPage() {
  const user = useDashboardUser();
  const { data: store } = useUserStore(user);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PRODUCTS_PAGE_SIZE);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuProduct, setMenuProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const offset = page * rowsPerPage;
  const { data, error, isError, isFetching, isPending, refetch } = useProducts(
    user,
    offset,
    rowsPerPage
  );
  const createProduct = useCreateProduct(user);
  const updateProduct = useUpdateProduct(user);
  const deleteProduct = useDeleteProduct(user);

  function closeCreateDialog() {
    if (!createProduct.isPending) {
      setIsCreateDialogOpen(false);
      createProduct.reset();
    }
  }

  function closeEditDialog() {
    if (!updateProduct.isPending) {
      setEditingProduct(null);
      updateProduct.reset();
    }
  }

  function closeDeleteDialog() {
    if (!deleteProduct.isPending) {
      setDeletingProduct(null);
      deleteProduct.reset();
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
                    <TableCell align="right">Existencia</TableCell>
                    <TableCell align="right">Precio unitario</TableCell>
                    <TableCell align="right" aria-label="Acciones" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.products.length ? (
                    data.products.map((product) => {
                      const warningColor = store
                        ? getStockWarningColor(
                            product,
                            store.settings.idealPercentageOfProduct,
                            store.settings.lowPercentageOfProduct
                          )
                        : null;

                      return (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                              {warningColor && (
                                <WarningAmberIcon
                                  color={warningColor}
                                  fontSize="small"
                                  aria-label={
                                    warningColor === 'error'
                                      ? 'Existencia baja'
                                      : 'Existencia por debajo del ideal'
                                  }
                                />
                              )}
                              <span>{product.stock ?? '—'}</span>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {product.unitaryPrice === null
                              ? '—'
                              : product.unitaryPrice.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                          </TableCell>
                          <TableCell align="right" padding="checkbox">
                            <IconButton
                              aria-label={`Opciones de ${product.name}`}
                              aria-haspopup="menu"
                              onClick={(event) => {
                                setMenuProduct(product);
                                setMenuAnchorEl(event.currentTarget);
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
              rowsPerPageOptions={[25, 50]}
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

            createProduct.mutate(
              getProductFields(formData),
              {
                onSuccess: () => setIsCreateDialogOpen(false),
              }
            );
          }}
        >
          <DialogTitle id="create-product-title">Crear producto</DialogTitle>
          <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
            {createProduct.isError && <Alert severity="error">{createProduct.error.message}</Alert>}
            <ProductInputFields />
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

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            updateProduct.reset();
            setEditingProduct(menuProduct);
            setMenuAnchorEl(null);
          }}
        >
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            deleteProduct.reset();
            setDeletingProduct(menuProduct);
            setMenuAnchorEl(null);
          }}
        >
          Eliminar
        </MenuItem>
      </Menu>

      <Dialog
        open={Boolean(editingProduct)}
        onClose={closeEditDialog}
        fullWidth
        maxWidth="sm"
        aria-labelledby="edit-product-title"
      >
        {editingProduct && (
          <Box
            key={editingProduct.id}
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              updateProduct.mutate(
                { id: editingProduct.id, product: getProductFields(formData) },
                { onSuccess: () => setEditingProduct(null) }
              );
            }}
          >
            <DialogTitle id="edit-product-title">Editar producto</DialogTitle>
            <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
              {updateProduct.isError && (
                <Alert severity="error">{updateProduct.error.message}</Alert>
              )}
              <ProductInputFields product={editingProduct} />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button type="button" onClick={closeEditDialog} disabled={updateProduct.isPending}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      <Dialog
        open={Boolean(deletingProduct)}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-product-title"
      >
        <DialogTitle id="delete-product-title">Eliminar producto</DialogTitle>
        <DialogContent>
          {deleteProduct.isError && <Alert severity="error">{deleteProduct.error.message}</Alert>}
          ¿Estás seguro de que deseas eliminar {deletingProduct?.name}?
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" onClick={closeDeleteDialog} disabled={deleteProduct.isPending}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteProduct.isPending}
            onClick={() => {
              if (deletingProduct) {
                deleteProduct.mutate(deletingProduct.id, {
                  onSuccess: () => setDeletingProduct(null),
                });
              }
            }}
          >
            {deleteProduct.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
