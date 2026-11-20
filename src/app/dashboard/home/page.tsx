'use client';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonIcon from '@mui/icons-material/Person';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
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
  useUpdateUserStore,
  useUserProfile,
  useUserStore,
} from '../../../services/user/user-queries';
import {
  DEFAULT_PRODUCTS_PAGE_SIZE,
  useProductsBelowIdeal,
  useProductsWithLowQuantity,
} from '../../../services/products/products-queries';

function EditablePercentageSetting({
  label,
  value,
  isPending,
  error,
  onEdit,
  onSave,
}: {
  label: string;
  value: number;
  isPending: boolean;
  error: Error | null;
  onEdit: () => void;
  onSave: (value: number, onSuccess: () => void) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  if (isEditing) {
    const parsedValue = Number(inputValue);
    const isValid = inputValue.trim() !== '' && Number.isFinite(parsedValue);

    return (
      <Box sx={{ mb: 2, mt: -1 }}>
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!isValid || isPending) {
              return;
            }

            onSave(parsedValue, () => setIsEditing(false));
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <TextField
            autoFocus
            required
            type="number"
            size="small"
            label={label}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            slotProps={{ htmlInput: { step: 'any' } }}
          />
          <Button type="submit" variant="contained" disabled={!isValid || isPending}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button type="button" disabled={isPending} onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error.message}
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: -1, mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {'<' + value}%
      </Typography>
      <IconButton
        aria-label={`Edit ${label}`}
        size="small"
        disabled={isPending}
        onClick={() => {
          onEdit();
          setInputValue(String(value));
          setIsEditing(true);
        }}
      >
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default function DashboardHomePage() {
  const user = useDashboardUser();
  const [isEditingStoreName, setIsEditingStoreName] = useState(false);
  const [storeNameInput, setStoreNameInput] = useState('');
  const [belowIdealPage, setBelowIdealPage] = useState(0);
  const [belowIdealRowsPerPage, setBelowIdealRowsPerPage] = useState(
    DEFAULT_PRODUCTS_PAGE_SIZE
  );
  const [lowQuantityPage, setLowQuantityPage] = useState(0);
  const [lowQuantityRowsPerPage, setLowQuantityRowsPerPage] = useState(
    DEFAULT_PRODUCTS_PAGE_SIZE
  );
  const {
    data: profile,
    error: profileError,
    isPending: isProfilePending,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useUserProfile(user);
  const {
    data: store,
    error: storeError,
    isError: isStoreError,
    isPending: isStorePending,
    refetch: refetchStore,
  } = useUserStore(user);
  const updateStore = useUpdateUserStore(user);
  const {
    data: products,
    error: productsError,
    isError: isProductsError,
    isFetching: isFetchingProducts,
    isPending: areProductsPending,
    refetch: refetchProducts,
  } = useProductsBelowIdeal(user, belowIdealPage * belowIdealRowsPerPage, belowIdealRowsPerPage);
  const {
    data: lowQuantityProducts,
    error: lowQuantityError,
    isError: isLowQuantityError,
    isFetching: isFetchingLowQuantity,
    isPending: areLowQuantityProductsPending,
    refetch: refetchLowQuantityProducts,
  } = useProductsWithLowQuantity(
    user,
    lowQuantityPage * lowQuantityRowsPerPage,
    lowQuantityRowsPerPage
  );

  function saveStorePercentage(
    field: 'idealPercentageOfProduct' | 'lowPercentageOfProduct',
    value: number,
    onSuccess: () => void
  ) {
    if (!store) {
      return;
    }

    updateStore.mutate(
      {
        name: store.name,
        settings: { ...store.settings, [field]: value },
      },
      { onSuccess }
    );
  }

  return (
    <Box>
      {isProfilePending ? (
        <CircularProgress aria-label="Loading user name" />
      ) : (
        <Box sx={{ mb: 3 }}>
          {isProfileError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void refetchProfile()}>
                  Reintentar
                </Button>
              }
              sx={{ mb: 1 }}
            >
              {profileError.message}
            </Alert>
          ) : (
            <Typography
              component="h1"
              variant="h4"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PersonIcon aria-hidden="true" />
              ¡Hola, {profile.name}!
            </Typography>
          )}
          {isStorePending ? (
            <CircularProgress aria-label="Loading store name" size={20} sx={{ mt: 1 }} />
          ) : isStoreError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void refetchStore()}>
                  Reintentar
                </Button>
              }
              sx={{ mt: 1 }}
            >
              {storeError.message}
            </Alert>
          ) : isEditingStoreName ? (
            <Box sx={{ mt: 1 }}>
              <Box
                component="form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const name = storeNameInput.trim();
                  if (!name || updateStore.isPending) {
                    return;
                  }

                  updateStore.mutate(
                    { name, settings: store.settings },
                    { onSuccess: () => setIsEditingStoreName(false) }
                  );
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <TextField
                  autoFocus
                  required
                  size="small"
                  label="Nombre de la tienda"
                  value={storeNameInput}
                  onChange={(event) => setStoreNameInput(event.target.value)}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!storeNameInput.trim() || updateStore.isPending}
                >
                  {updateStore.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button
                  type="button"
                  disabled={updateStore.isPending}
                  onClick={() => {
                    updateStore.reset();
                    setStoreNameInput(store.name);
                    setIsEditingStoreName(false);
                  }}
                >
                  Cancelar
                </Button>
              </Box>
              {updateStore.isError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {updateStore.error.message}
                </Alert>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <StoreOutlinedIcon aria-hidden="true" />
                {store.name}
              </Typography>
              <IconButton
                aria-label={`Edit store name ${store.name}`}
                size="small"
                disabled={updateStore.isPending}
                onClick={() => {
                  updateStore.reset();
                  setStoreNameInput(store.name);
                  setIsEditingStoreName(true);
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      )}

      <Typography
        component="h2"
        variant="h5"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
      >
        <WarningAmberIcon color="warning" aria-hidden="true" />
        Productos por debajo de la cantidad ideal
      </Typography>
      {store && (
        <EditablePercentageSetting
          label="Porcentaje ideal"
          value={store.settings.idealPercentageOfProduct}
          isPending={updateStore.isPending}
          error={updateStore.isError ? updateStore.error : null}
          onEdit={updateStore.reset}
          onSave={(value, onSuccess) =>
            saveStorePercentage('idealPercentageOfProduct', value, onSuccess)
          }
        />
      )}

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
                    <TableCell align="right">Existencia</TableCell>
                    <TableCell align="right">Precio unitario</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products?.products.length ? (
                    products.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
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
                  ) : isProductsError ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No se pudieron cargar los productos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No hay productos por debajo de la cantidad ideal.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={products?.totalOfProducts ?? 0}
              page={belowIdealPage}
              rowsPerPage={belowIdealRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              onPageChange={(_, selectedPage) => setBelowIdealPage(selectedPage)}
              onRowsPerPageChange={(event) => {
                setBelowIdealRowsPerPage(Number.parseInt(event.target.value, 10));
                setBelowIdealPage(0);
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

      <Typography
        component="h2"
        variant="h5"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4, mb: 2 }}
      >
        <WarningAmberIcon color="error" aria-hidden="true" />
        Productos con cantidad baja
      </Typography>
      {store && (
        <EditablePercentageSetting
          label="Porcentaje bajo"
          value={store.settings.lowPercentageOfProduct}
          isPending={updateStore.isPending}
          error={updateStore.isError ? updateStore.error : null}
          onEdit={updateStore.reset}
          onSave={(value, onSuccess) =>
            saveStorePercentage('lowPercentageOfProduct', value, onSuccess)
          }
        />
      )}

      {isLowQuantityError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetchLowQuantityProducts()}>
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
                    <TableCell align="right">Existencia</TableCell>
                    <TableCell align="right">Precio unitario</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowQuantityProducts?.products.length ? (
                    lowQuantityProducts.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
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
                  ) : isLowQuantityError ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No se pudieron cargar los productos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No hay productos con cantidad baja.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={lowQuantityProducts?.totalOfProducts ?? 0}
              page={lowQuantityPage}
              rowsPerPage={lowQuantityRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              onPageChange={(_, selectedPage) => setLowQuantityPage(selectedPage)}
              onRowsPerPageChange={(event) => {
                setLowQuantityRowsPerPage(Number.parseInt(event.target.value, 10));
                setLowQuantityPage(0);
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
    </Box>
  );
}
