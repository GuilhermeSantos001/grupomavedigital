import { Router } from 'express';

import { Router404Controller } from '@/graphql/controllers/Router404Controller';

import { CreateCostCenterController } from '@/graphql/controllers/CreateCostCenterController';
import { UpdateCostCenterController } from '@/graphql/controllers/UpdateCostCenterController';
import { FindCostCenterController } from '@/graphql/controllers/FindCostCenterController';
import { DeleteCostCenterController } from '@/graphql/controllers/DeleteCostCenterController';

const router = Router({
  strict: true,
  caseSensitive: true
});

const router404Controller = new Router404Controller();

const createCostCenter = new CreateCostCenterController();
const updateCostCenter = new UpdateCostCenterController();
const findCostCenter = new FindCostCenterController();
const deleteCostCenter = new DeleteCostCenterController();

router.post('/costcenter', createCostCenter.handle);
router.put('/costcenter/:id', updateCostCenter.handle);
router.get('/costcenter/:id', findCostCenter.handle);
router.delete('/costcenter/:id', deleteCostCenter.handle);

router.use(router404Controller.handle);

export { router as routerAPI };