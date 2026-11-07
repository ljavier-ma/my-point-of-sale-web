'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
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
import { useEffect, useState } from 'react';
import {
  DEFAULT_MOVEMENTS_PAGE_SIZE,
  useCreateMovement,
  useMovements,
} from '../../../services/movements/movements-queries';
import { useProductNames, useSearchProducts } from '../../../services/products/products-queries';
import type { ProductSearchResult } from '../../../services/products/products-service';
import { useDashboardUser } from '../dashboard-shell';

interface SelectedProduct extends ProductSearchResult {
  productTotal: string;
  quantity: string;
}

function formatMovementDate(seconds: number, nanoseconds: number) {
  return new Date(seconds * 1000 + nanoseconds / 1_000_000).toLocaleString('es', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MovementsPage() {
  const user = useDashboardUser();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_MOVEMENTS_PAGE_SIZE);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMovementAPurchase, setIsMovementAPurchase] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const offset = page * rowsPerPage;
  const { data, error, isError, isFetching, isPending, refetch } = useMovements(
    user,
    offset,
    rowsPerPage
  );
  const createMovement = useCreateMovement(user);
  const searchProducts = useSearchProducts(
    user,
    debouncedSearchText,
    isCreateDialogOpen && searchText.trim() === debouncedSearchText
  );
  const areSelectedProductsComplete =
    selectedProducts.length > 0 &&
    selectedProducts.every(
      (product) =>
        product.productTotal.trim() !== '' &&
        Number.isFinite(Number(product.productTotal)) &&
        Number(product.productTotal) >= 0 &&
        product.quantity.trim() !== '' &&
        Number.isInteger(Number(product.quantity)) &&
        Number(product.quantity) > 0
    );
  const productIds = [
    ...new Set(
      (
        data?.movements.flatMap((movement) =>
          movement.productDetails.map((detail) => detail.productId)
        ) ?? []
      ).filter(Boolean)
    ),
  ];
  const productNameQueries = useProductNames(user, productIds);
  const productNames = new Map(
    productNameQueries.flatMap((query, index) =>
      query.data === undefined ? [] : [[productIds[index], query.data]]
    )
  );
  const productNameErrors = productNameQueries.filter((query) => query.isError);
  const isLoadingProductNames = productNameQueries.some((query) => query.isPending);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchText(searchText.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  function resetCreateMovementForm() {
    setIsMovementAPurchase(false);
    setSearchText('');
    setDebouncedSearchText('');
    setSelectedProducts([]);
    createMovement.reset();
  }

  function closeCreateDialog() {
    if (!createMovement.isPending) {
      setIsCreateDialogOpen(false);
      resetCreateMovementForm();
    }
  }

  function addProduct(product: ProductSearchResult) {
    setSelectedProducts((currentProducts) =>
      currentProducts.some((selected) => selected.id === product.id)
        ? currentProducts
        : [...currentProducts, { ...product, productTotal: '', quantity: '' }]
    );
  }

  function updateSelectedProduct(
    productId: string,
    field: 'productTotal' | 'quantity',
    value: string
  ) {
    setSelectedProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId ? { ...product, [field]: value } : product
      )
    );
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
          Movimientos
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            resetCreateMovementForm();
            setIsCreateDialogOpen(true);
          }}
        >
          Crear movimiento
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

      {productNameErrors.length > 0 && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void Promise.all(productNameErrors.map((query) => query.refetch()))}
            >
              Reintentar
            </Button>
          }
          sx={{ mb: 2 }}
        >
          No se pudieron cargar algunos nombres de productos:{' '}
          {[...new Set(productNameErrors.map((query) => query.error.message))].join(' ')}
        </Alert>
      )}

      {isPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label="Cargando movimientos" />
        </Box>
      ) : (
        <>
          {isFetching && <CircularProgress size={20} sx={{ mb: 2 }} />}
          <Paper>
            <TableContainer>
              <Table aria-label="Movimientos">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha y hora</TableCell>
                    <TableCell>Productos</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.movements.length ? (
                    data.movements.map((movement) => {
                      const total = movement.productDetails.reduce(
                        (sum, detail) => sum + detail.productTotal,
                        0
                      );

                      return (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {formatMovementDate(movement.time._seconds, movement.time._nanoseconds)}
                          </TableCell>
                          <TableCell>
                            {movement.productDetails.length
                              ? movement.productDetails.map((detail, index) => (
                                  <Box key={`${detail.productId}-${index}`}>
                                    {productNames.get(detail.productId) ??
                                      (isLoadingProductNames
                                        ? 'Cargando producto...'
                                        : 'Producto desconocido')}{' '}
                                    <br />
                                    Cantidad: x{detail.quantity}
                                    <br />
                                    Total:{' $'}
                                    {detail.productTotal.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </Box>
                                ))
                              : '—'}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: movement.isMovementAPurchase ? 'error.main' : 'success.main',
                            }}
                          >
                            {movement.isMovementAPurchase ? '-' : '+'}$
                            {total.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No hay movimientos para mostrar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={data?.totalOfMovements ?? 0}
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
        aria-labelledby="create-movement-title"
      >
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!areSelectedProductsComplete) {
              return;
            }

            createMovement.mutate(
              {
                isMovementAPurchase,
                productDetails: selectedProducts.map((product) => ({
                  productTotal: Number(product.productTotal),
                  productId: product.id,
                  quantity: Number(product.quantity),
                })),
              },
              {
                onSuccess: () => {
                  setIsCreateDialogOpen(false);
                  resetCreateMovementForm();
                },
              }
            );
          }}
        >
          <DialogTitle id="create-movement-title">Crear movimiento</DialogTitle>
          <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
            {createMovement.isError && (
              <Alert severity="error">{createMovement.error.message}</Alert>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  name="isMovementAPurchase"
                  checked={isMovementAPurchase}
                  onChange={(event) => setIsMovementAPurchase(event.target.checked)}
                />
              }
              label="El movimiento es una compra"
            />

            <TextField
              autoFocus
              label="Buscar productos"
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
              helperText="Ingresa al menos tres caracteres para buscar productos."
            />

            {searchText.trim().length >= 3 && searchText.trim() === debouncedSearchText && (
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 240, overflowY: 'auto' }}>
                {searchProducts.isPending ? (
                  <CircularProgress size={24} aria-label="Buscando productos" />
                ) : searchProducts.isError ? (
                  <Alert
                    severity="error"
                    action={
                      <Button
                        type="button"
                        color="inherit"
                        size="small"
                        onClick={() => void searchProducts.refetch()}
                      >
                        Reintentar
                      </Button>
                    }
                  >
                    {searchProducts.error.message}
                  </Alert>
                ) : searchProducts.data?.length ? (
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    {searchProducts.data.map((product) => {
                      const isSelected = selectedProducts.some(
                        (selected) => selected.id === product.id
                      );

                      return (
                        <Box
                          key={product.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Typography>{product.name}</Typography>
                          <Button
                            type="button"
                            size="small"
                            disabled={isSelected}
                            onClick={() => addProduct(product)}
                          >
                            {isSelected ? 'Agregado' : 'Agregar producto'}
                          </Button>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography color="text.secondary">No se encontraron productos.</Typography>
                )}
              </Paper>
            )}

            {selectedProducts.map((product) => (
              <Paper key={product.id} variant="outlined" sx={{ display: 'grid', gap: 2, p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography>{product.name}</Typography>
                  <Button
                    type="button"
                    size="small"
                    color="error"
                    onClick={() =>
                      setSelectedProducts((currentProducts) =>
                        currentProducts.filter((selected) => selected.id !== product.id)
                      )
                    }
                  >
                    Quitar
                  </Button>
                </Box>
                <TextField
                  required
                  label="Total"
                  type="number"
                  value={product.productTotal}
                  onChange={(event) =>
                    updateSelectedProduct(product.id, 'productTotal', event.target.value)
                  }
                  slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                />
                <TextField
                  required
                  label="Cantidad"
                  type="number"
                  value={product.quantity}
                  onChange={(event) =>
                    updateSelectedProduct(product.id, 'quantity', event.target.value)
                  }
                  slotProps={{ htmlInput: { min: 1, step: 1 } }}
                />
              </Paper>
            ))}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button type="button" onClick={closeCreateDialog} disabled={createMovement.isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMovement.isPending || !areSelectedProductsComplete}
            >
              {createMovement.isPending ? 'Creando...' : 'Crear movimiento'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
