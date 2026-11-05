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
import { useDashboardUser } from '../dashboard-shell';
import { DEFAULT_PRODUCTS_PAGE_SIZE, useProducts } from '../../../services/products/products-queries';

export default function ProductsPage() {
  const user = useDashboardUser();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PRODUCTS_PAGE_SIZE);
  const offset = page * rowsPerPage;
  const { data, error, isError, isFetching, isPending, refetch } = useProducts(
    user,
    offset,
    rowsPerPage
  );

  return (
    <Box>
      <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
        Productos
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
                    <TableCell>Código</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell align="right">Existencia</TableCell>
                    <TableCell align="right">Precio público</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.products.length ? (
                    data.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell align="right">{product.stock}</TableCell>
                        <TableCell align="right">
                          {product.publicPrice.toLocaleString(undefined, {
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
    </Box>
  );
}
