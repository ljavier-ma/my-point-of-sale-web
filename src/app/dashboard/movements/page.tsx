'use client';

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
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import {
  DEFAULT_MOVEMENTS_PAGE_SIZE,
  useMovements,
} from '../../../services/movements/movements-queries';
import { useProductNames } from '../../../services/products/products-queries';
import { useDashboardUser } from '../dashboard-shell';

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
  const offset = page * rowsPerPage;
  const { data, error, isError, isFetching, isPending, refetch } = useMovements(
    user,
    offset,
    rowsPerPage
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

  return (
    <Box>
      <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
        Movimientos
      </Typography>

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
    </Box>
  );
}
